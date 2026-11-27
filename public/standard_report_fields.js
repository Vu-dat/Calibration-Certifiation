'use strict';

const standardReportFields = (() => {
  function standardDueDate(val) {
    const date = String(val || '').trim().split('T')[0];
    return /^(?:1900|0000)(?:[-./]|$)|(?:^|[-./])(?:1900|0000)$/.test(date) ? '' : date;
  }

  function displayStandardDueDate(val) {
    return standardDueDate(val).replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3.$2.$1');
  }

  function clockStandardEntry(row = {}, fallbackId = '') {
    return {
      name: row.NAME || row.name || '',
      id: String(row.ID || row.id || row.EQUIPMENT_ID || fallbackId).trim(),
      certNo: row.GCN || row.gcn || row.STD_CERT_NO || row.certNo || '',
      trace: String(row.LINK || row.link || row.lienKet || '').trim().replace(/^QUATEST 3$/i, 'QUATEST III'),
      due: standardDueDate(row.VALIDITY || row.validity || row.NEXT_DUE || row.next_due)
    };
  }

  function crockingStandardIds(names) {
    names = names
      .map(name => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
        .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    if (names.some(name => /\bjis\b/.test(name))) return [];
    const auto = names.some(name => /^(?:auto crocking meter|may thu ben mau ma sat tu dong)$/.test(name));
    const manualOrRotary = names.some(name => /^(?:(?:manual |rotary )?crocking meter|may crocking meter|may thu ben mau ma sat(?: xoay tron)?)$/.test(name));
    if (!auto && !manualOrRotary) return [];
    const ids = ['LAB-BALANCE.01', 'LAB-CALIPER.01'];
    if (auto) ids.push('LAB-TACHO.01');
    return ids;
  }

  function resolveStandards({ names, templateIds = [], saved = [], catalog = [], instrumentIds = [] }) {
    const findClock = id => {
      const code = String(id).trim().toUpperCase();
      return code && catalog.find(row => [row.ID, row.id, row.EQUIPMENT_ID, row.KEY_FIELD, row.key_field]
        .some(value => String(value || '').trim().toUpperCase() === code));
    };
    const previous = saved.map(row => {
      const id = String(row.EQ_CODE || row.eq_code || row.id || '').trim();
      const clock = findClock(id);
      const live = clockStandardEntry(clock, id);
      let savedCert = String(row.STD_CERT_NO || row.std_cert_no || row.certNo || '').trim();
      const savedTrace = String(row.LINK || row.link || row.trace || '').trim();
      const manufacturer = String(clock?.MANUFACTURER || clock?.manufacturer || '').trim();
      const due = standardDueDate(row.VALIDITY || row.validity || row.due);
      const legacyBalance = id.toUpperCase() === 'LAB-BALANCE.01' && due === '2026-10-31' && live.trace === 'QUATEST III';
      if (legacyBalance && savedCert === '170630023') savedCert = '';
      return {
        name: row.EQ_NAME || row.eq_name || row.name || live.name,
        id,
        certNo: standardCertificateNumber(savedCert, ...instrumentIds) || live.certNo,
        trace: (savedTrace && !(legacyBalance && /^TECHMASTER$/i.test(savedTrace)) && savedTrace.toLowerCase() !== manufacturer.toLowerCase() &&
          !/^(?:mitutoyo|labex|thb|tenmars)$/i.test(savedTrace) ? savedTrace.replace(/^QUATEST 3$/i, 'QUATEST III') : '') || live.trace,
        due: due || live.due
      };
    });

    const ids = crockingStandardIds(names);
    if (ids.length) {
      return ids.map(id => {
        const alternate = id === ids[0] ? id : id.replace(/01$/, '02');
        const row = previous.find(item => [id, alternate].includes(String(item.id).toUpperCase()));
        const configuredId = templateIds.find(value => [id, alternate].includes(String(value).toUpperCase()));
        const primary = clockStandardEntry(findClock(configuredId || id), configuredId || id);
        const backupId = String(configuredId).toUpperCase() === alternate ? id : alternate;
        const backup = clockStandardEntry(findClock(backupId), backupId);
        const selectedId = row?.id || (primary.due || !backup.due ? primary.id : backup.id);
        const live = clockStandardEntry(findClock(selectedId), selectedId);
        return row ? { ...row, name: live.name || row.name } : live;
      });
    }

    if (previous.length) return previous.slice(0, 5);
    return templateIds.slice(0, 5).map(id => clockStandardEntry(findClock(id), id));
  }

  function standardCertificateNumber(value, ...instrumentIds) {
    const number = String(value || '').trim();
    return instrumentIds.some(id => String(id || '').trim().toLowerCase() === number.toLowerCase()) ? '' : number;
  }

  async function resolveStoredStandards(cert, saved, loadClock, equipmentName = '', certificateNumber = '') {
    const names = [equipmentName, cert.INSTRUMENT_NAME_EN, cert.INSTRUMENT_NAME];
    if (!crockingStandardIds(names).length) return saved;
    return resolveStandards({
      names, saved, catalog: await loadClock(),
      instrumentIds: [cert.CERT_NO, cert.EQUIPMENT_ID, certificateNumber]
    }).map(row => ({
      CERT_NO: cert.CERT_NO,
      EQ_CODE: row.id,
      EQ_NAME: row.name,
      STD_CERT_NO: row.certNo,
      LINK: row.trace,
      VALIDITY: row.due
    }));
  }

  return {
    standardDueDate, displayStandardDueDate, standardCertificateNumber, clockStandardEntry, resolveStandards, resolveStoredStandards
  };
})();

if (typeof module !== 'undefined') module.exports = standardReportFields;
