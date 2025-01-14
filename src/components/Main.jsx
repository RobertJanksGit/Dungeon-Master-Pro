import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import warlock from "../assets/image (3).jpg";
import malePaladin from "../assets/image (6).jpg";
import orc from "../assets/image (11).jpg";
import femalePaladin from "../assets/image (7).jpg";

export default function Main() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div>
      <section className="flex justify-center mb-8">
        <div className="w-full sm:w-[500px] md:w-[700px] lg:w-[800px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden shadow-lg mx-auto">
          <Slider {...sliderSettings}>
            <div>
              <img
                src={warlock}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={malePaladin}
                alt="Slide 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={orc}
                alt="Slide 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={femalePaladin}
                alt="Slide 4"
                className="w-full h-full object-cover"
              />
            </div>
          </Slider>
        </div>
      </section>

      <section className="text-center px-4 py-8">
        <h2 className="text-3xl font-bold mb-4">
          Unleash Your Campaign's Potential
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Welcome to Dungeon Master Pro - your AI-powered companion for crafting
          unforgettable D&D adventures. Generate rich storylines, breathtaking
          character art, and dynamic maps with the power of AI. Whether you're a
          seasoned DM or just starting your journey, let our tools inspire your
          next epic campaign.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Story Generation</h3>
            <p className="text-gray-300">
              Create compelling narratives and plot twists with AI assistance
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Character Art</h3>
            <p className="text-gray-300">
              Bring your NPCs and characters to life with AI-generated artwork
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Map Creation</h3>
            <p className="text-gray-300">
              Design immersive worlds with our intuitive map creation tools
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
