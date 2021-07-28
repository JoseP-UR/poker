module.exports = (message, type = "log") => {
    const date = new Date();
    const dd = date.getDate() <  10 ? "0" + date.getDate() : date.getDate();
    const mm = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    const yyyy = date.getFullYear();
    const hh = date.getHours();
    const ii = date.getMinutes();
    const ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    let dd_mm_yyyy_hh_ii_ss = `${dd}/${mm}/${yyyy} ${hh}:${ii}:${ss}`;

    let result  = '';
    switch (type) {
        case "log":
            result = `[${dd_mm_yyyy_hh_ii_ss}] [log] ${message}`;
            break;
        case "warn":
            result = `[${dd_mm_yyyy_hh_ii_ss}] [warn] ${message}`;
            break;
        case "error":
            result = `[${dd_mm_yyyy_hh_ii_ss}] [error] ${message}`;
            break;
        default:
            result = `[${dd_mm_yyyy_hh_ii_ss}] [${type}] ${message}`;
            type = "log"
            break;
    }

    console[type](result);
    return;
};
