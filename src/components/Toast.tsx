import { AnimatePresence, motion } from "framer-motion";

interface Props {
  message: string;
  show: boolean;
}

const Toast = ({ message, show }: Props) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] glass-sm px-5 py-2.5 text-[13px] text-foreground whitespace-nowrap"
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

export default Toast;
