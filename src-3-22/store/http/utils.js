import history from '../../util/history';

export async function logout() {
  await localStorage.clear();
  history.push('/');
}
