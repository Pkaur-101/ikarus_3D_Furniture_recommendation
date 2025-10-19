import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!analytics)
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading Analytics...</Typography>
      </Container>
    );

  const brandData = Object.entries(analytics.top_brands).map(
    ([name, value]) => ({ name, value })
  );

  const categoryData = Object.entries(analytics.top_categories).map(
    ([name, value]) => ({
      name: name.slice(0, 30) + "...",
      value,
    })
  );

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Product Analytics Dashboard
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Visual insights into your dataset: top brands, categories, and pricing trends.
      </Typography>

      <Grid container spacing={4}>
        {/* Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Total Products: {analytics.total_products}
              </Typography>
              <Typography variant="h6" fontWeight={600} mt={1}>
                Average Price: ${analytics.avg_price.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Brands Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Top Brands
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brandData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories Chart */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Top Categories
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
