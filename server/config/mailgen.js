import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "salted",
  product: {
    // Appears in header & footer of e-mails
    name: "short.url",
    link: "https://short-link-ochre.vercel.app/",
    // Optional product logo
    // logo: 'https://mailgen.js/img/logo.png'
  },
});

export default mailGenerator;
