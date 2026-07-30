import Logo from "../ui/Logo";

const Footer = () => {
  return (
    <footer className="w-full bg-[#101828] text-white py-6 sm:py-8 px-6 mt-auto">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <Logo className="w-5 h-5 sm:w-6 sm:h-6" type="light" />
          <h3 className="font-semibold text-base sm:text-lg tracking-tight m-0 text-white">
            short.link
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          &copy; {new Date().getFullYear()} short.link. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
