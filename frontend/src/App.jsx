import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Link, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function UrlShortener() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setShortUrl('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.BACKEND_HOST}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
        setOriginalUrl(data.originalUrl);
        setMessage(data.message);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const visitShortUrl = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Link className="h-8 w-8 text-gray-800" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">URL Shortener</h1>
          <p className="text-sm text-gray-600">Transform long URLs into short, shareable links</p>
        </div>

        {/* Main Card */}
        <Card className="border-gray-400 shadow-sm min-h-[300px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg text-gray-900">Create Short Link</CardTitle>
            <CardDescription className="text-gray-600">
              Enter a URL to generate a shortened version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL Input */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && url) {
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={loading || !url}
              >
                {loading ? 'Creating...' : 'Shorten URL'}
              </Button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Result */}
            {shortUrl && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {/* Status Message */}
                {message && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      {message === 'Already exists' ? 'URL already shortened' : 'Short link created successfully'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Short URL Result */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Short URL:</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shortUrl}
                      readOnly
                      className="border-gray-200 bg-gray-50 text-gray-700 flex-1"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="icon"
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </Button>
                    <Button
                      onClick={visitShortUrl}
                      variant="outline"
                      size="icon"
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>

                {/* Original URL Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Original URL:</label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600 break-all">{originalUrl}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Click analytics and custom domains coming soon
          </p>
        </div>
      </div>
    </div>
  );
}