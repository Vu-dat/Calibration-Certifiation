'use strict';

const measurementReport = (() => {
  const fields = ['param', 'point', 'found', 'refValue', 'unc', 'tol', 'conf'];
  const number = value => {
    const input = String(value ?? '').trim().replace(',', '.');
    return /^[-+]?\d+(?:\.\d+)?$/.test(input) ? Number(input) : NaN;
  };
  const precision = values => Math.min(12, Math.max(1, ...values.map(value => String(value).split(/[.,]/)[1]?.length || 0)));
  const decimal = (value, digits) => Number(value.toFixed(digits)).toFixed(digits).replace('.', ',');
  function difference(row, direction = 1) {
    const result = number(row.refValue) - number(row.found);
    return Number.isFinite(result) ? decimal(direction * result, precision([row.refValue, row.found])) : '';
  }
  const formulas = new Map([
    ['difference', difference],
    ['indicationMinusReference', row => difference(row, -1)]
  ]);

  function profile(value) {
    try {
      const config = typeof value === 'string' ? JSON.parse(value) : value;
      if (!config?.tables?.length || !Array.isArray(config.tables)) return null;
      return config.tables.every(table =>
        Array.isArray(table.parameters) && table.parameters.length && table.parameters.every(parameter => typeof parameter === 'string') &&
        Array.isArray(table.columns) && table.columns.length && table.columns.every(column => column &&
          (fields.includes(column.field) || formulas.has(column.formula)) &&
          Array.isArray(column.label) && column.label.length === 2 && column.label.every(label => typeof label === 'string') &&
          Number.isFinite(column.width) && column.width > 0) &&
        (!table.defaults || Array.isArray(table.defaults)) &&
        (!table.unit || (typeof table.unit.default === 'string' && typeof table.unit.label === 'string')) &&
        (!table.groupBy || (fields.includes(table.groupBy) && table.columns.some(column => column.field === table.groupBy)))
      ) ? config : null;
    } catch {
      return null;
    }
  }

  function normalizeSpecRange(config, value) {
    const [label, ...aliases] = config?.blankSpecLabels || [];
    if (!label) return value;
    return String(value || '').split('\n').map(line => {
      const colon = line.indexOf(':');
      const title = (colon < 0 ? line : line.slice(0, colon)).trim();
      const contents = colon < 0 ? '' : line.slice(colon + 1).trim();
      return [label, ...aliases].includes(title) && (!contents || config.legacySpecValues?.includes(contents))
        ? label + ':' : line;
    }).join('\n');
  }

  function read(row) {
    return {
      param: String(row.param ?? row.PARAMETER_NAME ?? row.parameterName ?? ''),
      point: row.point ?? row.CAL_POINT ?? row.calPoint ?? '',
      found: String(row.foundAvg || row.found || row.AS_FOUND_VALUE || row.asFoundValue || ''),
      refValue: row.refValue ?? row.REFERENCE_VALUE ?? row.referenceValue ?? '',
      unc: row.unc ?? row.UNCERTAINTY ?? row.uncertainty ?? '',
      tol: row.tol ?? row.TOLERANCE ?? row.tolerance ?? '',
      conf: row.conf ?? row.CONFORMITY ?? row.conformity ?? ''
    };
  }

  function parameter(table, unit) {
    return table.unit ? `${table.parameters[0]} (${unit || table.unit.default})` : table.parameters[0];
  }

  function readTables(config, points) {
    const records = points.map(read);
    return config.tables.map(table => {
      const removeUnit = name => table.unit ? name.replace(/\s*\([^()]+\)\s*$/, '') : name;
      const normalize = name => removeUnit(name).normalize('NFC').replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim().toLowerCase();
      const accepted = table.parameters.map(normalize);
      const rows = records.flatMap(row => {
        let param = row.param;
        let point = row.point;
        if (table.legacyPointPrefix) {
          const split = param.lastIndexOf(table.legacyPointPrefix);
          if (split >= 0 && accepted.includes(normalize(param.slice(split + table.legacyPointPrefix.length)))) {
            point = param.slice(0, split).trim();
            param = param.slice(split + table.legacyPointPrefix.length);
          }
        }
        if (table.annotations) param = param.replace(/\s+Loadcell:.*$/is, '');
        if (!accepted.includes(normalize(param))) return [];
        const values = row.found.split('/').map(value => value.trim());
        const numbers = values.map(number);
        const found = table.averageLegacyReadings && values.length > 1 && numbers.every(Number.isFinite)
          ? decimal(numbers.reduce((sum, value) => sum + value, 0) / numbers.length, precision(values))
          : row.found;
        return [{ ...row, param, point, found, refValue: row.refValue || row[table.legacyReference] || '' }];
      });
      const unit = table.unit ? rows[0]?.param.match(/\(([^()]+)\)\s*$/)?.[1] || table.unit.default : '';
      return { ...table, rows: prepareRows(table, rows), unitValue: unit };
    });
  }

  function prepareRows(table, rows, selected) {
    if (table.sharedChoice) {
      const { field, options } = table.sharedChoice;
      const choice = selected || rows.find(row => options.includes(row[field]))?.[field] || '';
      rows = rows.map(row => ({ ...row, [field]: choice, conf: selected && row[field] !== choice ? '' : row.conf }));
    }
    if (table.derivedReading) {
      const { parameter, source, formula } = table.derivedReading;
      const sourceRow = rows.find(row => row.param === source);
      if (sourceRow && formula === 'areaFromDiameterMm') {
        const diameter = number(sourceRow.found);
        const area = diameter > 0 ? decimal(Math.PI * (diameter / 20) ** 2, 3) : '';
        rows = rows.map(row => row.param === parameter ? { ...row, found: area } : row);
      }
    }
    if (table.scale) {
      rows = rows.map(row => ({
        ...row, tol: row.tol === 'Tra bảng dưới' ? '' : row.tol,
        conf: Number.isFinite(number(row.found)) ? row.conf : ''
      }));
    }
    return rows;
  }

  function filterBySpecRange(config, points, specRange) {
    const limit = config?.rangeLimit;
    if (!limit) return points;
    const match = /\b0\s*[~–—-]\s*(\d+)\s*\)?\s*mm/i.exec(String(specRange || ''));
    const max = limit.options.includes(Number(match?.[1])) ? Number(match[1]) : limit.default;
    return points.filter(point => {
      const row = read(point);
      const position = number(row.point || row.refValue);
      return !Number.isFinite(position) || position <= max;
    });
  }

  function scaleRows(table, rows, max) {
    const requested = Number(max);
    if (!table.scale?.options.includes(requested)) return rows;
    const tolerance = table.scale.tolerances.find(([min, limit]) => requested >= min && requested <= limit)?.[2] || '';
    const previous = new Map(rows.filter(row => Number.isFinite(number(row.found))).map(row => [number(row.found), row]));
    return Array.from({ length: table.scale.divisions }, (_, index) => {
      const found = String(requested * (index + 1) / table.scale.divisions);
      const saved = previous.get(Number(found));
      return { ...table.defaults?.[index], ...saved, param: table.parameters[0], point: found, found, tol: tolerance,
        conf: saved?.tol === tolerance ? saved.conf || '' : '' };
    });
  }

  function catalogRows(config, sources, points) {
    const { catalog } = config;
    return readTables(config, points).flatMap(table => {
      if (table.catalogColumn === undefined) return table.rows;
      const previous = new Map(table.rows.map(row => [catalog.aliases?.[row.point] || row.point, row]));
      return sources.map(source => {
        const saved = previous.get(source);
        const entry = catalog.entries[source]?.[table.catalogColumn] || '';
        const threshold = /^≥\s*(.+)$/.exec(entry)?.[1];
        return {
          ...saved, param: table.parameters[0], point: source,
          refValue: threshold || entry || saved?.refValue || '',
          unc: saved?.unc || table.defaultUncertainty || '',
          tol: table.sharedChoice ? table.rows[0]?.tol || '' : threshold ? entry : saved?.tol || ''
        };
      });
    });
  }

  function annotationText(table, row) {
    if (row.param !== table.annotations?.parameter) return '';
    return String(row.point || '').split('\n').filter(line =>
      table.annotations.labels.some(label => line.startsWith(label + ': ') && line.slice(label.length + 2).trim())
    ).join('\n');
  }

  function defaultRows(table, group) {
    return (table.defaults || []).map(row => ({
      ...row, param: row.param || parameter(table, table.unitValue),
      ...(group === undefined ? {} : { [table.groupBy]: group })
    }));
  }

  function columnValue(column, row, formatted) {
    if (column.formula) return formulas.get(column.formula)?.(row) || '';
    const value = String(row[column.field] ?? '');
    if (formatted && column.format === 'decimal') return /^[-+]?\d+$/.test(value) ? value + ',0' : value.replace('.', ',');
    if (formatted && column.format === 'bilingual') return value.replace('/', '\n');
    return value;
  }

  function headers(table) {
    return table.columns.map(column => [...column.label, column.unit === '$unit' ? table.unitValue : column.unit]);
  }

  function tables(config, points) {
    return readTables(config, points).map(table => {
      const width = table.columns.reduce((sum, column) => sum + column.width, 0);
      return {
        heading: table.heading,
        headers: headers(table),
        weights: table.columns.map(column => column.width * 100 / width),
        groupColumn: table.columns.findIndex(column => table.groupBy && column.field === table.groupBy),
        rows: table.rows.map(row => table.columns.map(column => {
          const value = columnValue(column, row, true);
          const note = column.field === 'param' ? annotationText(table, row) : '';
          return note ? value + '\n' + note : value;
        }))
      };
    });
  }

  function cellSpan(table, row, column) {
    const group = table.groupColumn;
    const value = table.rows[row]?.[group];
    if (group < 0 || (column !== group && !table.groupColumns?.includes(column)) || !value) return 1;
    if (row > 0 && table.rows[row - 1][group] === value) return 0;
    let end = row + 1;
    while (end < table.rows.length && table.rows[end][group] === value) end++;
    return end - row;
  }

  function pages(config, points, notesHeight) {
    return pagesFromTables(tables(config, points), notesHeight);
  }

  function pagesFromTables(resultTables, notesHeight) {
    const result = [{ tables: [], end: 160.3 }];
    for (const table of resultTables) {
      const rows = table.rows.length ? table.rows : [Array(table.headers.length).fill('')];
      let index = 0;
      while (index < rows.length) {
        const page = result.at(-1);
        const headingY = page.end + (page.tables.length ? 12 : 0);
        const headerY = headingY + (table.heading ? 16 : 0);
        const capacity = Math.floor((790 - headerY - 43) / 32);
        if (capacity < 1) {
          result.push({ tables: [], end: 160.3 });
          continue;
        }
        let end = Math.min(rows.length, index + capacity);
        while (end > index && end < rows.length && cellSpan(table, end, table.groupColumn) === 0) end--;
        if (index === end && page.tables.length) {
          result.push({ tables: [], end: 160.3 });
          continue;
        }
        const chunk = rows.slice(index, end > index ? end : index + capacity);
        page.tables.push({ ...table, rows: chunk, headerY, headingY });
        page.end = headerY + 43 + chunk.length * 32;
        index += chunk.length;
      }
    }
    if (result.at(-1).end + 8 + notesHeight > 810) result.push({ tables: [], end: 152.3 });
    return result;
  }

  function ovenGroups(oven, points) {
    const records = points.map(read);
    return oven.tables.map((table, index) => {
      const rows = Array.from({ length: 9 }, (_, position) => records[index * 9 + position] || {});
      const references = rows.map((row, position) => number(table.avg?.[position] || row.refValue));
      const legacy = rows.flatMap(row => String(row.found || '').split('/')).map(number).filter(Number.isFinite);
      const indication = table.indication === undefined && legacy.length
        ? legacy.reduce((sum, value) => sum + value, 0) / legacy.length : number(table.indication);
      const correction = references.every(Number.isFinite) && Number.isFinite(indication)
        ? references.reduce((sum, value) => sum + value, 0) / 9 - indication : NaN;
      return { table, rows, references, indication, correction };
    });
  }

  function ovenTable(oven, points) {
    const display = value => Number.isFinite(value) ? decimal(value, 1) : '';
    return {
      headers: [
        ['Điểm đặt', 'Setting point', '°C'], ['Giá trị chỉ thị', 'Indication', '°C'],
        ['Vị trí đo', 'Position'], ['Giá trị chuẩn', 'Reference', '°C'],
        ['Số hiệu chính', 'Correction', '°C'], ['Độ đồng đều', 'Gradient', '°C'],
        ['Độ biến động', 'Fluctuation', '°C'], ['Độ KĐBĐ', 'Uncertainty', '°C'],
        ['Dung sai', 'Tolerance', '°C'], ['Kết luận', 'Conclusion']
      ],
      weights: [9, 10, 7, 11, 11, 10, 10, 11, 11, 10],
      groupColumn: 0,
      groupColumns: [4, 5, 6],
      rows: ovenGroups(oven, points).flatMap(group => group.rows.map((row, index) => [
        group.table.setPoint, display(group.indication), String(index + 1), display(group.references[index]),
        display(group.correction), group.table.gradient, group.table.fluctuation, row.unc, row.tol, row.conf
      ]))
    };
  }

  return { profile, normalizeSpecRange, parameter, readTables, prepareRows, scaleRows, catalogRows, annotationText, defaultRows, columnValue, headers, tables, pages, pagesFromTables, cellSpan, ovenGroups, ovenTable, filterBySpecRange };
})();

if (typeof module !== 'undefined') module.exports = measurementReport;
