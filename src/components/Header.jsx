export default function Header() {
  return (
    <div>
      <div className="flex justify-center items-center mb-4">
        <img src="../../public/logo.jpg" className="size-1/2" alt="Logo" />
      </div>
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-4">
          <button className="border-none bg-transparent text-slate-300">
            Dashboard
          </button>
          <button className="border-none bg-transparent text-slate-300">
            Characters
          </button>
          <button className="border-none bg-transparent text-slate-300">
            Campaigns
          </button>
          <button className="border-none bg-transparent text-slate-300">
            Maps
          </button>
        </div>
        <div className="flex space-x-4">
          <button className="border-none bg-transparent text-slate-300">
            Sign In
          </button>
          <button className="border-none bg-transparent text-slate-300">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
