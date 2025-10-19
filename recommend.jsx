import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import ProductCard from "../components/productcard";

const Recommend = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/recommend", {

        query: query,
        top_n: 3,
      });
      setResults(response.data.recommendations);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Product Recommendations
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Ask for any type of furniture (e.g., "modern wooden chair") to get AI recommendations.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <TextField
            fullWidth
            label="Search for furniture..."
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            sx={{ height: "100%" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
        </Grid>
      </Grid>

      {/* Results */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {results.map((product, index) => (
          <Grid item xs={12} md={4} key={index}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Recommend;
