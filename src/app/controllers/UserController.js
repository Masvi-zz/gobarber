import User from '../models/User';
import * as Yup from 'yup'; //pq nao tem um export default -> coloca na var Yup

class UserController {

  //create
  async store(req, res) {
    //validação
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
                .email()
                .required(),
      password: Yup.string()
                .required()
                .min(6)
    });

    //valida se o body está passando da forma correta conforme as regras definidas
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail.' });
    }

    //verifica se o usuário já existe (EMAIL)
    const userExists = await User.findOne({ where: {email: req.body.email } });

    if(userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const {id, name, email, provider} = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  //edit
  async update(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string()
                .email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
                   .min(6)
                   .when('oldPassword', (oldPassword, field) =>
                   oldPassword ? field.required() : field
                  ),
        confirmPassword: Yup.string().when('password', (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail.' });
    }

    /* busca email e oldPass do req.body*/
    const { email, oldPassword } = req.body;

    /* busca o usuario */
    const user = await User.findByPk(req.userId);

    /* verifica se o email passado é diferente que ele já tem (alteração)*/
    if (email != user.email) {
      const userExists = await User.findOne({ where: { email }});
      if (userExists) {
        return res.status(400).json( { error: 'User already exists.'} );
      }
    }
    /* se a oldPass bate com a senha salva, se estiver tentando alterar a senha*/
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password do not match'})
    }

    /*update com os dados vindos pelo req.body*/
    const { id, name, provider } = await user.update(req.body);

    /* retorna os atualizados* */
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
