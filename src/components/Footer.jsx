export default function Footer() {
  return (
    <>
      <>
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-800 max-w-screen-lg mx-auto">
          <div>
            <h3>ABOUT</h3>
            <button className="border-none bg-transparent">Contact Us</button>
            <button className="border-none bg-transparent">About</button>
          </div>
          <div>
            <h3>SOCIAL MEDIA</h3>
            <button className="border-none bg-transparent">x</button>
            <button className="border-none bg-transparent">TikTok</button>
            <button className="border-none bg-transparent">Discord</button>
          </div>
        </div>
      </>
    </>
  );
}
