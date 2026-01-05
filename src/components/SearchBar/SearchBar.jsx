import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.css";
import { SearchIcon, MicIcon } from "../Icons/index.jsx";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onVoiceClick,
  error,
  placeholder = "",
  autoFocus = false,
}) {
  const [touched, setTouched] = useState(false);
  const showError = (touched || value.length > 0) && Boolean(error);

  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
    inputRef.current?.focus();
  };

  const handleMicClick = () => {
    onVoiceClick?.();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div className={styles.wrapper}>
      <form
        className={`${styles.bar} ${showError ? styles.barError : ""}`}
        onSubmit={handleSubmit}
        onMouseDown={() => inputRef.current?.focus()} 
      >
        <button
          type="submit"
          className={styles.leftIconBtn}
          aria-label="Search"
          title="Search"
        >
          <SearchIcon className={styles.sbIcon} />
        </button>

        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          aria-label="Search Query"
        />

        <div className={styles.right}>
          <span className={styles.divider} aria-hidden="true" />
          <button
            type="button"
            className={styles.rightIconBtn}
            onClick={handleMicClick}
            aria-label="Voice"
            title="Voice"
          >
            <MicIcon className={styles.sbIcon} />
          </button>
        </div>
      </form>

      {showError && <div className={styles.error}>{error}</div>}
    </div>
  );
}