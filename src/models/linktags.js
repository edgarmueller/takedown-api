const linktags = (sequelize, DataTypes) => {
  const LinkTags = sequelize.define('linktags');
  return LinkTags;
}

export default linktags;