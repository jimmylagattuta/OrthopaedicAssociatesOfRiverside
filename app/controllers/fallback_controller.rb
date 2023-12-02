class FallbackController < ActionController::Base
  def index
    render file: Rails.root.join('app', 'public', 'index.html'), layout: false
  end
end