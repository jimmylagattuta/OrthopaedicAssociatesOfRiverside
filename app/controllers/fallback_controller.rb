class FallbackController < ActionController::Base
  def index
    render file: Rails.root.join('public', 'index.html'), layout: false
  end
end
