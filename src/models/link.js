import Tag from './tag';

const link = (sequelize, DataTypes) => {
  const Link = sequelize.define('link', {
    url: {
      type: DataTypes.STRING,
      validate: { 
        notEmpty: {
          args: true,
          msg: 'A URL must not be empty'
        }
      }
    },
    title: {
      type: DataTypes.STRING,
      validate: { 
        notEmpty: {
          args: true,
          msg: 'A title must not be empty'
        }
      }
    },
    done: {
      type: DataTypes.BOOLEAN
    }
  });

  Link.associate = models => {
    Link.Tags = Link.belongsToMany(models.Tag, { through: 'linktags' });
    Link.User = Link.belongsTo(models.User);
  };

  return Link;
};

export default link;
