#define BOOST_ASIO_ENABLE_OLD_SERVICES
#include <boost/asio.hpp> 
#include "crow_all.h" 
#include "sqlite3.h" 
#include <iostream>
#include <string>
#include <cstdlib>

using namespace std;

// Tạo cấu trúc cơ sở dữ liệu chuyên nghiệp kết nối thông tin chung và bảng điểm đo
void initEnterpriseDatabase() {
    sqlite3* DB;
    sqlite3_open("labmaster_enterprise.db", &DB);
    char* messError;

    // Bảng thông tin hành chính của Giấy Chứng Nhận
    string sqlCertificates = "CREATE TABLE IF NOT EXISTS CERTIFICATES ("
                             "CERT_NO TEXT PRIMARY KEY,"
                             "INSTRUMENT_NAME TEXT,"
                             "MANUFACTURER TEXT,"
                             "MODEL TEXT,"
                             "EQUIPMENT_ID TEXT,"
                             "SERIAL_NUMBER TEXT,"
                             "CUSTOMER_NAME TEXT,"
                             "CAL_DATE TEXT,"
                             "RE_CAL_DATE TEXT,"
                             "PROCEDURE TEXT,"
                             "REF_STANDARD TEXT,"
                             "TEMP_ENV TEXT,"
                             "HUMI_ENV TEXT,"
                             "HEAD_OF_LAB TEXT,"
                             "DIRECTOR TEXT);";

    // Bảng lưu trữ danh sách các điểm kết quả đo động liên kết qua CERT_NO (Foreign Key)
    string sqlPoints = "CREATE TABLE IF NOT EXISTS CALIBRATION_POINTS ("
                       "ID INTEGER PRIMARY KEY AUTOINCREMENT,"
                       "CERT_NO TEXT,"
                       "PARAMETER_NAME TEXT,"
                       "CAL_POINT REAL,"
                       "AS_FOUND_VALUE REAL,"
                       "UNCERTAINTY REAL,"
                       "TOLERANCE TEXT,"
                       "CONFORMITY TEXT);";

    // Bảng lưu trữ danh sách thiết bị chuẩn sử dụng cho Chứng nhận này
    string sqlStandards = "CREATE TABLE IF NOT EXISTS CERTIFICATE_STANDARDS ("
                          "ID INTEGER PRIMARY KEY AUTOINCREMENT,"
                          "CERT_NO TEXT,"
                          "EQ_CODE TEXT,"
                          "EQ_NAME TEXT,"
                          "LINK TEXT,"
                          "VALIDITY TEXT);";

    sqlite3_exec(DB, sqlCertificates.c_str(), NULL, 0, &messError);
    sqlite3_exec(DB, sqlPoints.c_str(), NULL, 0, &messError);
    sqlite3_exec(DB, sqlStandards.c_str(), NULL, 0, &messError);
    sqlite3_close(DB);
}

// Hàm lưu thông tin hành chính chứng nhận vào Database
bool saveCertInfo(string certNo, string name, string manu, string model, string eqId, string sn, string cust, string calD, string reCalD, string proc, string refSt, string temp, string humi, string head, string dir) {
    sqlite3* DB;
    if (sqlite3_open("labmaster_enterprise.db", &DB) != SQLITE_OK) return false;
    
    string sql = "INSERT OR REPLACE INTO CERTIFICATES VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(DB, sql.c_str(), -1, &stmt, NULL) != SQLITE_OK) { sqlite3_close(DB); return false; }
    
    sqlite3_bind_text(stmt, 1, certNo.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, manu.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, model.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, eqId.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, sn.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, cust.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 8, calD.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, reCalD.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 10, proc.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 11, refSt.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 12, temp.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 13, humi.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 14, head.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 15, dir.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    sqlite3_close(DB);
    return (rc == SQLITE_DONE);
}

// Hàm lưu điểm đo động
void savePointInfo(string certNo, string param, double cp, double af, double unc, string tol, string conf) {
    sqlite3* DB;
    sqlite3_open("labmaster_enterprise.db", &DB);
    string sql = "INSERT INTO CALIBRATION_POINTS (CERT_NO, PARAMETER_NAME, CAL_POINT, AS_FOUND_VALUE, UNCERTAINTY, TOLERANCE, CONFORMITY) VALUES (?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt;
    sqlite3_prepare_v2(DB, sql.c_str(), -1, &stmt, NULL);
    
    sqlite3_bind_text(stmt, 1, certNo.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, param.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_double(stmt, 3, cp);
    sqlite3_bind_double(stmt, 4, af);
    sqlite3_bind_double(stmt, 5, unc);
    sqlite3_bind_text(stmt, 6, tol.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, conf.c_str(), -1, SQLITE_TRANSIENT);
    
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    sqlite3_close(DB);
}

// Hàm lưu thiết bị chuẩn sử dụng
void saveStandardRef(string certNo, string code, string name, string link, string validity) {
    sqlite3* DB;
    sqlite3_open("labmaster_enterprise.db", &DB);
    string sql = "INSERT INTO CERTIFICATE_STANDARDS (CERT_NO, EQ_CODE, EQ_NAME, LINK, VALIDITY) VALUES (?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt;
    sqlite3_prepare_v2(DB, sql.c_str(), -1, &stmt, NULL);
    
    sqlite3_bind_text(stmt, 1, certNo.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, code.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, link.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, validity.c_str(), -1, SQLITE_TRANSIENT);
    
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    sqlite3_close(DB);
}

int main() {
    crow::SimpleApp app;
    initEnterpriseDatabase();

    // API tiếp nhận toàn bộ form lưu trữ dữ liệu đo động từ Frontend gửi xuống
    CROW_ROUTE(app, "/api/calibration/save-full").methods(crow::HTTPMethod::Post)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        crow::json::wvalue response_json;
        
        if (!x) {
            response_json["success"] = false;
            response_json["message"] = "Dữ liệu JSON sai cấu trúc!";
            return crow::response(400, response_json);
        }

        string certNo = x["certNo"].s();
        
        // Xóa dữ liệu cũ của Chứng nhận này để cập nhật mới
        sqlite3* DB;
        sqlite3_open("labmaster_enterprise.db", &DB);
        string delPoints = "DELETE FROM CALIBRATION_POINTS WHERE CERT_NO = '" + certNo + "';";
        string delStds = "DELETE FROM CERTIFICATE_STANDARDS WHERE CERT_NO = '" + certNo + "';";
        sqlite3_exec(DB, delPoints.c_str(), NULL, 0, NULL);
        sqlite3_exec(DB, delStds.c_str(), NULL, 0, NULL);
        sqlite3_close(DB);

        // Lưu thông tin tổng quan hành chính
        saveCertInfo(
            certNo, x["instrumentName"].s(), x["manufacturer"].s(), x["model"].s(),
            x["equipmentId"].s(), x["serialNumber"].s(), x["customerName"].s(),
            x["calDate"].s(), x["reCalDate"].s(), x["procedure"].s(), x["refStandard"].s(),
            x["tempEnv"].s(), x["humiEnv"].s(), x["headOfLab"].s(), x["director"].s()
        );

        // Lưu danh sách mảng các điểm đo động
        if (x.has("points")) {
            auto points_list = x["points"];
            for (auto& point : points_list) {
                savePointInfo(
                    certNo,
                    point["parameterName"].s(),
                    point["calPoint"].d(),
                    point["asFoundValue"].d(),
                    point["uncertainty"].d(),
                    point["tolerance"].s(),
                    point["conformity"].s()
                );
            }
        }

        // Lưu danh sách thiết bị chuẩn sử dụng
        if (x.has("standards")) {
            auto stds_list = x["standards"];
            for (auto& std : stds_list) {
                saveStandardRef(
                    certNo,
                    std["code"].s(),
                    std["name"].s(),
                    std["link"].s(),
                    std["validity"].s()
                );
            }
        }

        response_json["success"] = true;
        response_json["message"] = "Đã cập nhật toàn bộ thông tin hiệu chuẩn!";
        crow::response res(200, response_json);
        res.set_header("Access-Control-Allow-Origin", "*");
        return res;
    });

    // API kích hoạt tạo file PDF từ dữ liệu vừa lưu trong DB (Gọi ngầm file generate_pdf.js)
    CROW_ROUTE(app, "/api/calibration/export-pdf/<string>").methods(crow::HTTPMethod::Get)([](string certNo){
        crow::json::wvalue response_json;

        string command = "node generate_pdf.js " + certNo;
        int result = system(command.c_str()); 

        if (result == 0) {
            response_json["success"] = true;
            response_json["pdf_url"] = "/static/certificates/GCN_" + certNo + ".pdf";
        } else {
            response_json["success"] = false;
            response_json["message"] = "Không thể biên dịch file PDF!";
        }

        crow::response res(200, response_json);
        res.set_header("Access-Control-Allow-Origin", "*");
        return res;
    });

    app.port(18080).multithreaded().run();
}