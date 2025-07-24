import React from "react";
import { Card, CardContent } from "@mui/material";
import styles from "../studentHomePage.module.css";

const SectionCard = ({ children }) => (
  <Card className={styles.sectionCard} elevation={2}>
    <CardContent>{children}</CardContent>
  </Card>
);

export default SectionCard;
