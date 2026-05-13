export default function NavbarSection({
  activeUser,
  onLogout,
  setShowProfileEdit,
  setShowAdminUpload,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4 flex items-center justify-between flex-wrap gap-4">

      {/* left side */}

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
          logo
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800">
            ClassPlus Studio
          </h2>
        </div>
      </div>

      {/* right side */}
      <div className="flex items-center gap-3">
          <img
            src={activeUser.photo}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {activeUser.name}
            </p>
          </div>

        {/* buttons */}

        <button
          type="button"
          onClick={() => setShowProfileEdit(true)}
          className="px-4 py-2 text-black text-sm border rounded-xl hover:bg-gray-100"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => setShowAdminUpload(true)}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Upload
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 text-black text-sm border rounded-xl hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}