const path = require('path');
const newpath = __dirname + "/uploads/";
const ImageJS = require('imagejs');
const bitmap = new ImageJS.Bitmap();
exports.encoder = (req, res) => {
    let image = path.join(__dirname, './uploads/' + req.newFileName); // c:users/kubra/desktop/
    let message = req.body.message;
    console.log(message);
    let array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'r', 's', 't', 'u', 'v', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ']
            bitmap.readFile(image)
                .then(function (er) {
                    if (er)
                        console.log(er)
                    else {
                        let uzunluk = message.length
                        let kelimeUzunluguKacinciSirada = 0;
                        for (let sayac = 0; sayac < array.length; sayac++) {
                            if (uzunluk == array[sayac]) {
                                break;
                            } else {
                                kelimeUzunluguKacinciSirada++;
                            }
                        }
                        //console.log(kelimeUzunluguKacinciSirada)
                        let sifrelenenIndis = 0

                        for (let y = 0; y < bitmap.height; y++) {
                            for (let x = 0; x < bitmap.width; x++) {
                                if (sifrelenenIndis == uzunluk) {
                                    bitmap.writeFile(image, { quality: 75 })
                                        .then(function () {
                                            return res.status(200).json({ message: "Bitti"})
                                        });
                                    return;
                                }

                                let kacinciSirada = 0
                                for (let i = 0; i < array.length; i++) {
                                    if (message[sifrelenenIndis] == array[i]) {
                                        break;
                                    } else {
                                        kacinciSirada++;
                                    }
                                }

                                let color = {};
                                color = bitmap.getPixel(x, y, color)

                                r = color.r
                                g = color.g
                                b = color.b
                                a = color.a

                                let mod34R = r % 34;
                                let mod34B = b % 34;

                                //console.log("r pixel değeri ilk başta ", r, " idi. ", "Mod34 : ", mod34R, " Benim şifrelediğim : ", kelimeUzunluguKacinciSirada)

                                let farkR = mod34R - kelimeUzunluguKacinciSirada
                                let farkB = mod34B - kacinciSirada

                                b -= farkB


                                if (x == 0 && y == 0) {
                                    r -= farkR
                                }

                                bitmap.setPixel(x, y, r, g, b, a);
                                //console.log("fark : ", farkB)
                                //console.log(bitmap.getPixel(x, y, color))

                                //console.log("heh: ",bitmap.getPixel(x,y, color))


                                sifrelenenIndis++

                            }

                        }
                    }
                })

}

exports.decoder = (req, res) => {
    let image = path.join(__dirname, './uploads/' + req.params.image); // c:users/kubra/desktop/
    let sifrelenenMesaj="";
    let array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'r', 's', 't', 'u', 'v', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ']
    bitmap.readFile(image)
        .then(function (er) {
            if (er)
                console.log(er)
            else {
                let color = {};
                color = bitmap.getPixel(0, 0, color)
                r = color.r

                let uzunluk = array[r % 34]
                for (let y = 0; y < 1; y++) {
                    for (let x = 0; x < uzunluk; x++) {
                        color = bitmap.getPixel(x, y, color)
                        b = color.b
                        sifrelenenMesaj += array[b % 34]
                    }
                }
                //console.log(sifrelenenMesaj)
            }
            return res.status(200).json({message:sifrelenenMesaj})
        }).catch(() => {
            console.log(err);
            return res.status(401).json({
                error: 'Böyle Bir fotoğraf yok!'
            });
        })
}