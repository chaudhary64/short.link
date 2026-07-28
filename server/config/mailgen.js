import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "salted",
  product: {
    name: "short.url",
    link: "https://short-link-ochre.vercel.app/",
    logo: 'https://short-link-ochre.vercel.app/logo-dark-v2.svg'
  },
});

export default mailGenerator;
