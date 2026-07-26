import Logo from "../ui/Logo";

const Footer = () => {
  return (
    <footer className="w-full bg-[#101828] text-white py-8 px-6 mt-auto">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Logo className="w-6 h-6" bg="#ffffff" fg="#111827" />
          <h3 className="font-semibold text-lg tracking-tight m-0 text-white">
            short.link
          </h3>
        </div>
        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} short.link. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
