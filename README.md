# As soon as user signs up for the first time, shoot a welcome to chirp email.
# After the user changes the profile image, the change must be reflected in the main form and left sidebar.
# After logging out, once I open the user card, the `check-following` API is called which is throwing 401 error. If followers or following list is fetched, 500 error is received which is not handled by the client perfectly.
# If user is logged out, the `No more posts` text is not displayed properly.
# Move the `moveToUserPage` fn to usePostServices hook.
# In the user/posts and user/comments or user/saved components, the user card opens up but does not display all the details.