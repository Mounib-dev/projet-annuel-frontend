import { useRef, useEffect } from "react";
import { CircleX } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const DialogModal = ({
  isOpen,
  hasCloseBtn,
  onClose,
  children,
}: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modalElement = modalRef.current;

    if (!modalElement) return;

    if (isOpen) {
      modalElement.showModal();
    } else {
      modalElement.close();
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current) {
      const dialogBox = modalRef.current.getBoundingClientRect();
      const { clientX, clientY } = event;

      const isOutside =
        clientX < dialogBox.left ||
        clientX > dialogBox.right ||
        clientY < dialogBox.top ||
        clientY > dialogBox.bottom;

      if (isOutside) {
        handleCloseModal();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      <dialog
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="absolute mx-auto my-auto w-xl rounded-md bg-gray-900 p-5"
      >
        <div className="mb-2 flex justify-between">
          <h3 className="text-green-500">Nouvelle catégorie</h3>
          {hasCloseBtn && (
            <CircleX
              className="cursor-pointer text-green-500"
              onClick={handleCloseModal}
            />
          )}
        </div>

        {children}
      </dialog>
    </>
  );
};

export default DialogModal;
