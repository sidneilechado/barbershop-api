import * as Yup from 'yup';
import Products from '../models/Products';
import User from '../models/User';

class ProductsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const products = await Products.findAll({
      attributes: ['id', 'name', 'price', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(products);
  }

  async oneproduct(req, res) {
    const products = await Products.findByPk(req.params.id);

    return res.json(products);
  }

  async ownProducts(req, res) {
    const { page = 1 } = req.query;

    const products = await Products.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'name', 'price', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(products);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      price: Yup.string().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, price, description } = req.body;
    const products = await Products.create({
      name,
      price,
      description,
      user_id: req.userId,
    });

    return res.json(products);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string(),
      price: Yup.string(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const products = await Products.findByPk(req.body.id);

    await products.update(req.body);

    const { id, name, description, price } = req.body;

    return res.json({
      id,
      name,
      price,
      description,
    });
  }

  async delete(req, res) {
    const products = await Products.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (products.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permition to delete this product.",
      });
    }

    await Products.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({ Status: 'Product successfuly deleted' });
  }
}

export default new ProductsController();
