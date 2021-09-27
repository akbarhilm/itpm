function map(err){
    let message = ""
    switch (err) {
        case 1:
            message = "Tidak boleh duplikat"
            break;
        case 12899:
            message = "Terlalu Panjang"
            break;
       // case 904:
       //     message = "invalid nama kolom"
        //    break;
        case 1830:
            message = "Format tanggal salah (dd/mm/yyyy)"
            break;
        case 1861:
            message = "Format input salah"
            break;
        default:
            message = "undefined error"
            break;
    }

    return message
}

module.exports.map = map