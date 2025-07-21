const axios = require("axios");
const fs = require("fs");

async function fetchAndSaveBanks() {
    try {
        const res = await axios.get("https://api.vietqr.io/v2/banks");
        const banks = res.data.data;  // Kiểm tra response đúng structure này

        const formatted = banks.map(b => ({
            bankName: b.name || "",
            bankCode: b.code || "",
            binBank: b.bin || "",
            logo: b.logoUrl || b.logo || "",
            short_name: b.short_name || "",
            _id: undefined  // MongoDB tự tạo ObjectId khi import
        }));

        fs.writeFileSync("banks.json", JSON.stringify(formatted, null, 2));
        console.log(`Đã ghi ${formatted.length} ngân hàng vào banks.json`);
    } catch (err) {
        console.error("Lỗi khi fetch hoặc ghi file:", err);
    }
}

fetchAndSaveBanks();
