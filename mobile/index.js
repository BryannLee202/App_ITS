import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RootErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = window.location.origin + '/?force=' + Date.now();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.icon}>🌿</Text>
          <Text style={errorStyles.title}>EcoGo Smart Mobility</Text>
          <Text style={errorStyles.subtitle}>Ứng dụng đang tự động đồng bộ bản cập nhật mới.</Text>
          <TouchableOpacity style={errorStyles.btn} activeOpacity={0.8} onPress={this.handleReload}>
            <Text style={errorStyles.btnText}>Tải lại ngay</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  icon: {
    fontSize: 48,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4E3322',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  btn: {
    backgroundColor: '#4E3322',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  }
});

function Root() {
  return (
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

registerRootComponent(Root);
