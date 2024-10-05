import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FileUpload />
      </main>
    </div>
  );
};

export default Homepage;
