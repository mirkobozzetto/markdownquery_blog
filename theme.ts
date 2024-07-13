import { deep } from "@theme-ui/presets";
import { Theme } from "theme-ui";

const theme: Theme = {
  ...deep,
  styles: {
    ...deep.styles,
    root: {
      ...deep.styles.root,
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
    },
    h1: {
      ...deep.styles.h1,
      marginTop: 4,
      marginBottom: 3,
    },
    h2: {
      ...deep.styles.h2,
      marginTop: 4,
      marginBottom: 3,
    },
    p: {
      ...deep.styles.p,
      marginBottom: 3,
    },
    a: {
      ...deep.styles.a,
      color: "primary",
      textDecoration: "none",
      ":hover": {
        textDecoration: "underline",
      },
    },
    pre: {
      ...deep.styles.pre,
      padding: 3,
      borderRadius: 4,
      overflow: "auto",
    },
    code: {
      ...deep.styles.code,
      fontFamily: "monospace",
    },
  },
};

export default theme;
