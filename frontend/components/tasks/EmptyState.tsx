export default function EmptyState() {
  return (
    <div style={styles.container}>
      <div style={styles.mark}></div>
      <p style={styles.text}>No tasks yet</p>
      <p style={styles.subtext}>Add your first task above to get the team moving.</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: "center",
    padding: "60px 24px",
    borderTop: "1px solid #e0e0e0",
  },
  mark: {
    width: 24,
    height: 2,
    background: "#a3a3a3",
    margin: "0 auto 20px",
  },
  text: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0a0a0a",
    marginBottom: 8,
    letterSpacing: "-0.01em",
  },
  subtext: {
    fontSize: 14,
    color: "#a3a3a3",
  },
};
