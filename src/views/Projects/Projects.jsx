import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import ProjectSelectors from 'selectors/ProjectSelectors';
import InviteSelectors from 'selectors/InviteSelectors';
import UserSelectors from 'selectors/UserSelectors';
import ProjectActions from 'actions/ProjectActions';
import InviteActions from 'actions/InviteActions';
import AuthenticationActions from 'actions/AuthenticationActions';
import UserActions from 'actions/UserActions';
import Button from 'lib/components/Button';
import CenteredPanelView from 'lib/components/CenteredPanelView';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectList from './components/ProjectList';
import LoadingSpinner from 'lib/components/LoadingSpinner';
import Alert from 'lib/components/Alert';
import s from './Projects.css';


class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
    this.onCancelModal = this.onCancelModal.bind(this);
    this.onNewProjectClick = this.onNewProjectClick.bind(this);
  }

  componentDidMount() {
    const { inviteToken, listProjects, acceptProjectInvite, getMe } = this.props;
    if (inviteToken) {
      acceptProjectInvite(inviteToken)
        .then(() => listProjects())
        .catch(() => listProjects());
    } else {
      listProjects();
      getMe();
    }
  }

  onCancelModal() {
    this.setState({ modalOpen: false });
  }

  onNewProjectClick() {
    this.setState({ modalOpen: true });
  }

  render() {
    const { isFetching, inviteIsSending, me, history } = this.props;

    const panelFooter = me.get('isAdmin') ? (
      <Button btnStyle="primary" onClick={this.onNewProjectClick} block>
        New project
      </Button>
    ) : null;

    let body;
    if (isFetching || inviteIsSending) {
      body = (
        <LoadingSpinner className={s.loadingSpinner} />
      );
    } else if (!this.props.projects.length) {
      body = (
        <Alert className={s.alert}>
          You do not yet have any projects.
          <br />
          Click the button below to get started!
        </Alert>
      );
    } else {
      body = (
        <ProjectList projects={this.props.projects} />
      );
    }

    return (
      <CenteredPanelView
        className={s.projects}
        onClickLogout={this.props.logout}
        footer={panelFooter}
      >
        { body }

        <CreateProjectModal
          onCancel={this.onCancelModal}
          isOpened={this.state.modalOpen}
          history={history}
        />
      </CenteredPanelView>
    );
  }
}

Projects.propTypes = {
  listProjects: PropTypes.func.isRequired,
  me: PropTypes.instanceOf(Map).isRequired,
  projects: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  acceptProjectInvite: PropTypes.func.isRequired,
  inviteToken: PropTypes.string,
  inviteIsSending: PropTypes.bool.isRequired,
  getMe: PropTypes.func.isRequired,
  history: PropTypes.shape().isRequired
};

const mapStateToProps = (state) => {
  return {
    me: UserSelectors.me(state),
    projects: ProjectSelectors.listData(state).get('results').toJS(),
    isFetching: ProjectSelectors.listIsFetching(state),
    inviteToken: InviteSelectors.inviteToken(state),
    inviteIsSending: InviteSelectors.detailIsSending(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout() {
      dispatch(AuthenticationActions.logout());
    },
    listProjects() {
      dispatch(ProjectActions.list());
    },
    acceptProjectInvite(token) {
      return dispatch(InviteActions.accept(token)).payload;
    },
    getMe() {
      dispatch(UserActions.getMe());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
