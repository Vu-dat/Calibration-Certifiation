cmake_minimum_required(VERSION 3.15)
project(LabMasterBackend CXX)
add_compile_definitions(CROW_USE_BOOST)
set(CMAKE_CXX_STANDARD 17)

# Tự động tìm bộ thư viện Boost
find_package(Boost REQUIRED COMPONENTS system)

# ĐĂNG KÝ BẮT BUỘC: Thêm file sqlite3.c sát sườn file main.cpp
add_executable(server main.cpp sqlite3.c)

if(WIN32)
    target_link_libraries(server PRIVATE ws2_32 mswsock)
endif()

# Liên kết Boost vào dự án
target_link_libraries(server PRIVATE Boost::boost)