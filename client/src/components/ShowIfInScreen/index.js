import React from 'react';
import s from './index.module.css';

class ShowIfInScreen extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.listen = true;

    this.state = {
      show: false,
    };
  }

  checkVisibility = () => {
    const { offsetTop } = this.ref.current;

    const triggerPoint = window.outerHeight * 2 / 3;

    if (window.scrollY + triggerPoint > offsetTop) {
      window.removeEventListener('scroll', this.checkVisibility);
      this.listen = false;

      this.setState({
        show: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.listen) {
      window.removeEventListener('scroll', this.checkVisibility);
    }
  }

  componentDidMount() {
    this.checkVisibility();
    window.addEventListener('scroll', this.checkVisibility);
  }

  render() {
    const { children } = this.props;
    const { show } = this.state;

    return (
      <div ref={this.ref} className={show ? s.root : s.hidden}>
        {children}
      </div>
    )
  }
}

export default ShowIfInScreen;
