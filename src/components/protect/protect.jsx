import { Component } from 'react';

class ErrorBoundary extends Component {
    state = {
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        const { error } = this.state;

        if (error) {
            return (
                <div>
                    <p>Seems like an error occured!</p>
                    <p>{error.message}</p>
                    <p>{JSON.stringify(error)}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;