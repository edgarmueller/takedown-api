import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    },
    socialProvider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    socialProviderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    socialProviderToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
  });

  User.beforeCreate(async user => {
    if (user.password) {
      user.password = await user.generatePasswordHash();  
    }
  });

  User.prototype.generatePasswordHash = async function() {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  };

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = models => {
    User.Links = User.hasMany(models.Link, { onDelete: 'CASCADE' });
    User.Tag = User.hasMany(models.Tag, { onDelete: 'CASCADE' });
  };

  User.upsertGoogleUser = async (
    { accessToken, refreshToken, profile },
  ) => {

    let user = await User.findBySocialProviderId({ 
      socialProvider: 'social.googleProvider', 
      providerId: profile.id
    });

    if (!user) {
      user = await User.create({
        username: profile.displayName || $`${profile.familyName} ${profile.givenName}`,
        email: profile.emails[0].value,
        socialProvider: 'social.googleProvider',
        socialProviderId: profile.id,
        socialProviderToken: accessToken
      });
    }

    return user;
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }


    return user;
  };

  User.findBySocialProviderId = async function({ socialProvider, providerId }) {
    return await User.findOne({
      where: {
        socialProvider: socialProvider || null,
        socialProviderId: providerId || null
      }
    })
  }

  return User;
};

export default user;
