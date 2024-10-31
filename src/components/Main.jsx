import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
                src="../../public/image (3).jpg"
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="../../public/image (6).jpg"
                alt="Slide 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="../../public/image (11).jpg"
                alt="Slide 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="../../public/image (7).jpg"
                alt="Slide 4"
                className="w-full h-full object-cover"
              />
            </div>
          </Slider>
        </div>
      </section>

      <section>
        <h2>Sales Pitch Here</h2>
        <p>
          Welcome to our site! Discover the best deals and offerings tailored
          just for you.
        </p>
      </section>
    </div>
  );
}
