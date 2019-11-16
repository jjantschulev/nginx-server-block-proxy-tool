const { execSync } = require("child_process");
const { highlight } = require("./highlight");

function testForCertbot() {
    let result = "";
    try {
        result = execSync("command -v certbot").toString('utf-8');;
    } catch (e) {
        console.error("Certbot is not installed. Please install it before using https.");
        process.exit(1);
    }
    if (result !== "/usr/bin/certbot\n") {
        console.error("Certbot is not installed. Please install it before using https.");
        process.exit(1);
    }
}

function getCerts() {
    testForCertbot();
    console.log(execSync("sudo certbot certificates").toString());
}

function createCert(domain, email) {
    const command = `sudo certbot certonly --webroot -d ${domain} -w /var/www/letsencrypt -m ${email} --noninteractive --no-eff-email --agree-tos --keep-until-expiring`;

    console.log(`\nCertbot create/renew ====== ${highlight(domain)} ======`)
    execSync(command);
}



module.exports = { getCerts, createCert }