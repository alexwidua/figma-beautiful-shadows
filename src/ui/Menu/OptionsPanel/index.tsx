import { h } from "preact";
import { Container, VerticalSpace } from "@create-figma-plugin/ui";
import Parameters from "./options/Parameters";
import Type from "./options/Type";
import { Panel } from "./Panel";
import styles from "./index.css";

const Options = ({ bounds, anchor, open, onClose }: any) => {
  return (
    <Panel
      title={<Type />}
      boundsRef={bounds}
      anchorRef={anchor}
      open={open}
      onClose={onClose}
      anchorAlign="RIGHT"
      anchorMargin={0}
    >
      <Container space={"small"} style={{ width: 224 }}>
        <VerticalSpace space={"small"} />
        <Parameters />
        <VerticalSpace space={"small"} />
      </Container>
    </Panel>
  );
};

export default Options;
