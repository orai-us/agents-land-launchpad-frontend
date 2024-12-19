const Footer = () => {
  return (
    <div className="bg-[#13141D] text-[#84869A] font-medium md:text-[14px] text-[12px] py-4 flex justify-center items-center px-3">
      <div className="flex md:justify-between items-center w-full max-w-[1216px] flex-col md:flex-row justify-center gap-3">
        <div>© {new Date().getFullYear()} Agent Land. All rights reserved</div>
        <div className="md:text-right text-center">
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply
        </div>
      </div>
    </div>
  );
};

export default Footer;
