import Layout from './components/Layout';
// ...existing imports...

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ...existing routes... */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mybookings"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MyBookings />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/myreservations"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MyReservations />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    {/* ...existing routes... */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}
