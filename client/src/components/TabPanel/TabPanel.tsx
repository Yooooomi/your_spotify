interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export default function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}>
      {value === index && children}
    </div>
  );
}
