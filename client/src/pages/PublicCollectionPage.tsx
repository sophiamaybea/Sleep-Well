import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';

const PublicCollectionPage: React.FC = () => {
  const params = useParams<{ username: string; slug: string }>();
  const username = params.username;
  const slug = params.slug;
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/public/${username}/${slug}`);
        const data = await response.json();
        setCollection(data);
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [username, slug]);

  if (loading) return <div>Loading...</div>;
  if (!collection) return <div>Collection not found.</div>;

  const { title, description, author, poems, price } = collection;

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>by {author}</p>
      <div>
        {poems?.map((poem: any, index: number) => (
          <div key={index} className="border p-4 mb-4 rounded">
            <h2>{poem.title}</h2>
            <p>{poem.content}</p>
          </div>
        ))}
      </div>
      {price > 0 && (
        <button>Buy Collection - ${price}</button>
      )}
    </div>
  );
};

export default PublicCollectionPage;
