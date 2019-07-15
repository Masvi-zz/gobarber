import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {

  /*definindo local para salvar imagem e código unico para o nome.
  afim de evitar nomes estranhos ou duplicados*/

  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {

        if (err) return cb(err); //se erro retorna o callback com o erro

        /*se nao deu erro...transforma 16 byts aleatrios em uma string hexdecimal
        concatenado com a extencao do arquivo*/
        return cb(null, res.toString('hex') + extname(file.originalname));
      })
    },
  }),
};
