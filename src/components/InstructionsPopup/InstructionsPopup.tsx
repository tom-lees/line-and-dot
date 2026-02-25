export const InstructionsPopup = ({
  isMobile,
  onClose,
}: {
  isMobile: boolean;
  onClose?: () => void;
}) => {
  const touchInstructions = (
    <>
      <li>1 finger to drag / pan</li>
      <li>2 fingers to rotate</li>
      <li>Pinch to zoom</li>
    </>
  );

  const mouseInstructions = (
    <>
      <li>Left click to drag / pan</li>
      <li>Right click to rotate</li>
      <li>Scroll wheel / trackpad to zoom</li>
    </>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">How to Navigate</h2>

        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          {isMobile ? (
            <>
              {touchInstructions}
              <hr className="my-3" />
              {mouseInstructions}
            </>
          ) : (
            <>
              {mouseInstructions}
              <hr className="my-3" />
              {touchInstructions}
            </>
          )}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InstructionsPopup;
