import styles from "./instructionsComponent.module.css";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>
            welcome to Group 1's <span>voting-dapp</span>
          </h1>
        </div>
      </header>
    </div>
  );
}
