const PageWrapper = ({ children }) => {
  return (
    <div className="animate-fade-in animate-duration-500 animate-ease-out">
      {children}
    </div>
  );
};

export default PageWrapper;
