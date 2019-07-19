module.exports = {
  firstUpper: username => {
    const name = username.toLowerCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

  lowerCase: str => {
    return str.toLowerCase();
  },

  upperCase: str => {
    return str.toUpperCase();
  },

  normalizeGreek: text => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
};
