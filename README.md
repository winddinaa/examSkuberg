# examSkuberg

ทาง email จะมีการส่ง env กับ คอลเล็คชั่นไปให้นะครับ

หลังจากเอา env มาใส่แล้ว

# run project

1. ใช้คำสั่ง npm install
2. ใช้คำสั่ง node server.js

# get data สำหรับ test

db ใหม่
ใช้คำสั่ง node prepareDataNewDB.js
db ตามคอนฟิกของผม
ใช้คำสั่ง node prepareData.js

ในเมลจะมี env ของผม + คอลเล็คชั่นไปด้วยครับ

# get tb สำหรับ ดูดาต้า

เอาไว้ใช้ในเส้น ใส่ชื่อ tb ที่สนใจใน params
http://localhost:3000/api/getDB/:tb
[
"cryptoBags",
"cryptos",
"fiat",
"fiatBags",
"status",
"transaction",
"typeTransaction",
"users",
];

# ขั้นตอนการเทส

- add users
  API add user
  มี validate ตัวเล็กตัวใหญ่, ตัวเลข2ตัว,ขั้นต่ำ 8, ไม่มีสเปค
  http://localhost:3000/api/auth/login

- add order
  order buy and sell เป็นเส้นเดียวกันแยกกันตาม body
  รายละเอียด body อยู่ ใน collection
  http://localhost:3000/api/order

- confirm order
  order buy and sell เป็นเส้นเดียวกันแยกกันตาม
  รายละเอียด body อยู่ ใน collection
  http://localhost:3000/api/order/Confirm
- transfer
  http://localhost:3000/api/order/transfer
