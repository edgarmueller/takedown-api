const tag = (sequelize, DataTypes) => {
  const Tag = sequelize.define('tag', {
    name: {
      type: DataTypes.STRING,
      validate: { 
        notEmpty: {
          args: true,
          msg: 'A tag name must not be empty'
        }
      }
    },
    description: {
      type: DataTypes.STRING
    },
  });

  Tag.associate = models => {
    Tag.Link = Tag.belongsToMany(models.Link, { through: 'linktags' });
    Tag.User = Tag.belongsTo(models.User);
  };

  return Tag;
};

export default tag;
