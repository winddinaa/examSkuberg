# examSkuberg

ทาง email จะมีการส่ง env กับ คอลเล็คชั่นไปให้นะครับ

หลังจากเอา env มาใส่แล้ว

# run project

ใช้คำสั่ง node server.js

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
