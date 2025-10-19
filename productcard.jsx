import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";

const ProductCard = ({ product }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        transition: "0.3s",
        "&:hover": { transform: "scale(1.03)" },
      }}
    >
      <CardMedia
        component="img"
        image={product.image}
        alt={product.title}
        height="200"
      />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>
          {product.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.brand}
        </Typography>
        <Typography variant="body1" color="primary" mt={1}>
          {product.price || "—"}
        </Typography>
        <Box mt={1}>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
